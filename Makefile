.PHONY: test

test:
	docker exec testmint_backend python -m pytest tests/test_api.py -v
