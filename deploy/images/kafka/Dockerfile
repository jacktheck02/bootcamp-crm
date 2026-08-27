FROM apache/kafka:3.9.1
USER root
# OpenShift runs containers as an arbitrary UID in group 0:
# make config/scripts writable by the root group so the entrypoint can render config.
RUN chgrp -R 0 /opt/kafka /etc/kafka && chmod -R g=u /opt/kafka /etc/kafka
USER appuser