package com.pawanblog.tickets.domain.dtos;

import com.pawanblog.tickets.domain.entities.TicketStatusEnum;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ListTicketResponseDto {
  private UUID id;
  private TicketStatusEnum status;
  private ListTicketTicketTypeResponseDto ticketType;
  private UUID eventId;
  private String eventName;
  private String eventVenue;
  private LocalDateTime eventStart;
  private LocalDateTime eventEnd;
}
