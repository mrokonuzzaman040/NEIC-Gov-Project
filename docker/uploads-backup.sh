#!/bin/sh
set -e

SOURCE_DIR=${UPLOADS_SOURCE_DIR:-/uploads}
DEST_DIR=${UPLOADS_BACKUP_DIR:-/backups}
INTERVAL=${UPLOADS_BACKUP_INTERVAL_SECONDS:-86400}
RETENTION_DAYS=${UPLOADS_BACKUP_RETENTION_DAYS:-7}

mkdir -p "$DEST_DIR"

log() {
  printf '%s %s\n' "[$(date +'%Y-%m-%dT%H:%M:%S%z')]" "$1"
}

while true; do
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  ARCHIVE_PATH="${DEST_DIR}/uploads-${TIMESTAMP}.tar.gz"
  log "Starting uploads backup -> ${ARCHIVE_PATH}"

  if tar -czf "$ARCHIVE_PATH" -C "$SOURCE_DIR" . 2>/tmp/uploads-backup.err; then
    log "Backup completed. Cleaning archives older than ${RETENTION_DAYS} day(s)."
    find "$DEST_DIR" -type f -name 'uploads-*.tar.gz' -mtime +"$RETENTION_DAYS" -delete
  else
    log "Backup failed: $(cat /tmp/uploads-backup.err)"
    rm -f "$ARCHIVE_PATH"
  fi

  sleep "$INTERVAL"
done
