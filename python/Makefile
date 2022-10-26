
deploy: build_bundle
	cdk deploy

build_bundle:
	rm -rf ./build || true
	mkdir ./build
	cp -r ./lambda_handler/* ./build
	pip install --target ./build -r requirements.txt
	zip -r ./build.zip ./build
