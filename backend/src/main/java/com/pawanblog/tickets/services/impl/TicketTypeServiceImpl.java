package com.pawanblog.tickets.services.impl;

import com.pawanblog.tickets.domain.entities.Event;
import com.pawanblog.tickets.domain.entities.EventStatusEnum;
import com.pawanblog.tickets.domain.entities.Ticket;
import com.pawanblog.tickets.domain.entities.TicketStatusEnum;
import com.pawanblog.tickets.domain.entities.TicketType;
import com.pawanblog.tickets.domain.entities.User;
import com.pawanblog.tickets.exceptions.TicketSalesClosedException;
import com.pawanblog.tickets.exceptions.TicketTypeNotFoundException;
import com.pawanblog.tickets.exceptions.TicketsSoldOutException;
import com.pawanblog.tickets.exceptions.UserNotFoundException;
import com.pawanblog.tickets.repositories.TicketRepository;
import com.pawanblog.tickets.repositories.TicketTypeRepository;
import com.pawanblog.tickets.repositories.UserRepository;
import com.pawanblog.tickets.services.QrCodeService;
import com.pawanblog.tickets.services.TicketTypeService;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketTypeServiceImpl implements TicketTypeService {

  private final UserRepository userRepository;
  private final TicketTypeRepository ticketTypeRepository;
  private final TicketRepository ticketRepository;
  private final QrCodeService qrCodeService;

  @Override
  @Transactional
  public Ticket purchaseTicket(UUID userId, UUID ticketTypeId) {
    User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(
        String.format("User with ID %s was not found", userId)
    ));

    TicketType ticketType = ticketTypeRepository.findByIdWithLock(ticketTypeId)
        .orElseThrow(() -> new TicketTypeNotFoundException(
            String.format("Ticket type with ID %s was not found", ticketTypeId)
        ));

    // Tickets can only be bought for events that are live
    Event event = ticketType.getEvent();
    if (event.getStatus() != EventStatusEnum.PUBLISHED) {
      throw new TicketTypeNotFoundException(
          String.format("Ticket type with ID %s was not found", ticketTypeId));
    }

    LocalDateTime now = LocalDateTime.now();
    if (event.getSalesStart() != null && now.isBefore(event.getSalesStart())) {
      throw new TicketSalesClosedException("Ticket sales haven't opened yet");
    }
    if (event.getSalesEnd() != null && now.isAfter(event.getSalesEnd())) {
      throw new TicketSalesClosedException("Ticket sales for this event have closed");
    }

    // A null total means unlimited tickets
    Integer totalAvailable = ticketType.getTotalAvailable();
    if (totalAvailable != null) {
      int purchasedTickets = ticketRepository.countByTicketTypeId(ticketType.getId());
      if (purchasedTickets + 1 > totalAvailable) {
        throw new TicketsSoldOutException();
      }
    }

    Ticket ticket = new Ticket();
    ticket.setStatus(TicketStatusEnum.PURCHASED);
    ticket.setTicketType(ticketType);
    ticket.setPurchaser(user);

    Ticket savedTicket = ticketRepository.save(ticket);
    qrCodeService.generateQrCode(savedTicket);

    return ticketRepository.save(savedTicket);
  }
}
