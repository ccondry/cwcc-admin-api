#!/bin/sh
echo "Uninstalling cwcc-admin-api..."
echo "Disabling systemd service..."
sudo systemctl disable cwcc-admin-api.service
echo "Uninstall finished. You can now remove this folder if you wish."
