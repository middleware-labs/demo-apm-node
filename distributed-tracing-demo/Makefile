# Makefile for Distributed Tracing Demo

# Variables
NODE = node
NPM = npm
GO = go

# Phony targets
.PHONY: all install build run clean

# Default target
all: install build run

# Install dependencies
install:
	@echo "Installing Node.js dependencies..."
	$(NPM) init -y
	${NPM} i express @middleware.io/node-apm cors
	@echo "Installing Go dependencies..."
	@if [ ! -f go-app-3002/go.mod ]; then \
		echo "Initializing Go module for go-app-3002"; \
		cd go-app-3002 && $(GO) mod init go-app-3002; \
	fi
	@if [ ! -f go-app-3003/go.mod ]; then \
		echo "Initializing Go module for go-app-3003"; \
		cd go-app-3003 && $(GO) mod init go-app-3003; \
	fi
	cd go-app-3002 && $(GO) mod tidy
	cd go-app-3003 && $(GO) mod tidy

# Build Go applications
build:
	@echo "Building Go applications..."
	cd go-app-3002 && $(GO) build -o app
	cd go-app-3003 && $(GO) build -o app

# Run all applications
# Having some issue
# Prefer starting in seperate shells
run:
	@echo "Starting all applications..."
	$(NODE) app1.js &
	$(NODE) app2.js &
	cd go-app-3002 && ./app &
	cd go-app-3003 && ./app &

# Stop all applications
stop:
	@echo "Stopping all applications..."
	@echo "This command requires sudo privileges. You may be prompted for your password."
	sudo lsof -ti:3000 | xargs kill -9
	sudo lsof -ti:3001 | xargs kill -9
	sudo lsof -ti:3002 | xargs kill -9
	sudo lsof -ti:3003 | xargs kill -9

# Clean up build artifacts
clean:
	@echo "Cleaning up..."
	rm -f go-app-3002/app go-app-3002/go.sum
	rm -f go-app-3003/app go-app-3003/go.sum

# Help target
help:
	@echo "Makefile for Distributed Tracing Demo"
	@echo "Usage:"
	@echo "  make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all      - Install dependencies, build, and run all applications (default)"
	@echo "  install  - Install dependencies for all applications"
	@echo "  build    - Build Go applications"
	@echo "  run      - Run all applications"
	@echo "  stop     - Stop all running applications"
	@echo "  clean    - Remove build artifacts"
	@echo "  help     - Display this help message"