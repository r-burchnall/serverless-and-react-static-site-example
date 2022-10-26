
deploy: build_bundle_poetry
	cdk deploy

build_bundle:
	rm -rf ./build || true
	mkdir ./build
	cp -r ./lambda_handler/* ./build
	pip install --target ./build -r requirements.txt
	zip -r ./build.zip ./build

build_bundle_poetry:
	rm -rf ./build || true
	poetry build
	poetry run pip install -t bundle dist/*.whl
	cd bundle; zip -r ../build.zip . -x '*.pyc'
