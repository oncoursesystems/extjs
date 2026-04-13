FROM eclipse-temurin:8-jdk-noble

# Install Sencha CMD
COPY sencha-cmd-install.sh /tmp/sencha-cmd-install.sh
RUN chmod +x /tmp/sencha-cmd-install.sh \
    && /tmp/sencha-cmd-install.sh -q -dir /opt/sencha-cmd \
    && rm /tmp/sencha-cmd-install.sh
ENV PATH="/opt/sencha-cmd:${PATH}"

# Copy the ExtJS framework source
COPY . /ext

# Verify installation
RUN sencha which && ls /ext/packages
