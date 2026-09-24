FROM quay.io/keycloak/keycloak:latest
COPY event-ticket-platform-realm.json /opt/keycloak/data/import/
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm"]
