FROM quay.io/keycloak/keycloak:latest AS builder
ENV KC_DB=postgres
# Do Keycloak's slow build step here so the container starts quickly on Render
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:latest
COPY --from=builder /opt/keycloak/ /opt/keycloak/
COPY event-ticket-platform-realm.json /opt/keycloak/data/import/
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", "--optimized", "--import-realm"]
