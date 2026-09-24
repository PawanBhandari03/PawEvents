package com.pawanblog.tickets.mappers;

import com.pawanblog.tickets.domain.dtos.GetTicketResponseDto;
import com.pawanblog.tickets.domain.dtos.ListTicketResponseDto;
import com.pawanblog.tickets.domain.dtos.ListTicketTicketTypeResponseDto;
import com.pawanblog.tickets.domain.entities.Ticket;
import com.pawanblog.tickets.domain.entities.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TicketMapper {

  ListTicketTicketTypeResponseDto toListTicketTicketTypeResponseDto(TicketType ticketType);

  @Mapping(target = "eventId", source = "ticket.ticketType.event.id")
  @Mapping(target = "eventName", source = "ticket.ticketType.event.name")
  @Mapping(target = "eventVenue", source = "ticket.ticketType.event.venue")
  @Mapping(target = "eventStart", source = "ticket.ticketType.event.start")
  @Mapping(target = "eventEnd", source = "ticket.ticketType.event.end")
  ListTicketResponseDto toListTicketResponseDto(Ticket ticket);

  @Mapping(target = "ticketTypeName", source = "ticket.ticketType.name")
  @Mapping(target = "price", source = "ticket.ticketType.price")
  @Mapping(target = "description", source = "ticket.ticketType.description")
  @Mapping(target = "eventName", source = "ticket.ticketType.event.name")
  @Mapping(target = "eventVenue", source = "ticket.ticketType.event.venue")
  @Mapping(target = "eventStart", source = "ticket.ticketType.event.start")
  @Mapping(target = "eventEnd", source = "ticket.ticketType.event.end")
  GetTicketResponseDto toGetTicketResponseDto(Ticket ticket);

}
