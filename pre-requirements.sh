#!/bin/bash
set -e
set -u

SUDO=$(command -v sudo || true)

$SUDO yum install -y \
	pkgconfig \
	systemd-devel
