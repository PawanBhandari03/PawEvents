package com.pawevents.tickets.services;

import com.pawevents.tickets.domain.entities.QrCode;
import com.pawevents.tickets.domain.entities.Ticket;
import java.util.UUID;

public interface QrCodeService {

  QrCode generateQrCode(Ticket ticket);

  byte[] getQrCodeImageForUserAndTicket(UUID userId, UUID ticketId);
}
