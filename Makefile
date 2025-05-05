.PHONY: build start

help:
	@echo "Usage: make <command>"
	@echo ""
	@echo "Commands:"
	@echo "  build     Run 'npm run build' to build the project"
	@echo "  start     Start the dev server (http://localhost:3000)"
	@echo "  help      Show this help message"

build:
	npm install
	npm run build

start:
	@echo "Starting development server at http://localhost:3000"
	npm run dev