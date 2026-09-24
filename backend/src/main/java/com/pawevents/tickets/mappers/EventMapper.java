package com.pawevents.tickets.mappers;

import com.pawevents.tickets.domain.CreateEventRequest;
import com.pawevents.tickets.domain.CreateTicketTypeRequest;
import com.pawevents.tickets.domain.UpdateEventRequest;
import com.pawevents.tickets.domain.UpdateTicketTypeRequest;
import com.pawevents.tickets.domain.dtos.CreateEventRequestDto;
import com.pawevents.tickets.domain.dtos.CreateEventResponseDto;
import com.pawevents.tickets.domain.dtos.CreateTicketTypeRequestDto;
import com.pawevents.tickets.domain.dtos.GetEventDetailsResponseDto;
import com.pawevents.tickets.domain.dtos.GetEventDetailsTicketTypesResponseDto;
import com.pawevents.tickets.domain.dtos.GetPublishedEventDetailsResponseDto;
import com.pawevents.tickets.domain.dtos.GetPublishedEventDetailsTicketTypesResponseDto;
import com.pawevents.tickets.domain.dtos.ListEventResponseDto;
import com.pawevents.tickets.domain.dtos.ListEventTicketTypeResponseDto;
import com.pawevents.tickets.domain.dtos.ListPublishedEventResponseDto;
import com.pawevents.tickets.domain.dtos.UpdateEventRequestDto;
import com.pawevents.tickets.domain.dtos.UpdateEventResponseDto;
import com.pawevents.tickets.domain.dtos.UpdateTicketTypeRequestDto;
import com.pawevents.tickets.domain.dtos.UpdateTicketTypeResponseDto;
import com.pawevents.tickets.domain.entities.Event;
import com.pawevents.tickets.domain.entities.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EventMapper {

  CreateTicketTypeRequest fromDto(CreateTicketTypeRequestDto dto);

  CreateEventRequest fromDto(CreateEventRequestDto dto);

  CreateEventResponseDto toDto(Event event);

  ListEventTicketTypeResponseDto toDto(TicketType ticketType);

  ListEventResponseDto toListEventResponseDto(Event event);

  GetEventDetailsTicketTypesResponseDto toGetEventDetailsTicketTypesResponseDto(
      TicketType ticketType);

  GetEventDetailsResponseDto toGetEventDetailsResponseDto(Event event);

  UpdateTicketTypeRequest fromDto(UpdateTicketTypeRequestDto dto);

  UpdateEventRequest fromDto(UpdateEventRequestDto dto);

  UpdateTicketTypeResponseDto toUpdateTicketTypeResponseDto(TicketType ticketType);

  UpdateEventResponseDto toUpdateEventResponseDto(Event event);

  ListPublishedEventResponseDto toListPublishedEventResponseDto(Event event);

  GetPublishedEventDetailsTicketTypesResponseDto toGetPublishedEventDetailsTicketTypesResponseDto(
      TicketType ticketType);

  GetPublishedEventDetailsResponseDto toGetPublishedEventDetailsResponseDto(Event event);
}
