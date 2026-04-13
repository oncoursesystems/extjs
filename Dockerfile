FROM eclipse-temurin:21-jdk-noble

# Install Sencha CMD from the installer extracted by CI
COPY sencha-cmd-install.sh /tmp/sencha-cmd-install.sh
RUN chmod +x /tmp/sencha-cmd-install.sh \
    && INSTALL4J_JAVA_HOME="$JAVA_HOME" /tmp/sencha-cmd-install.sh -q -dir /opt/sencha-cmd \
    && rm /tmp/sencha-cmd-install.sh
ENV PATH="/opt/sencha-cmd:${PATH}"

# Copy the ExtJS framework source
COPY . /ext

# Verify installation
RUN sencha which && ls /ext/packages
