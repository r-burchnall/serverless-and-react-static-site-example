.PHONY: build cdk-deploy

deploy: build
	ENV=uat \
	EMAIL_ADDRESS=ross.burchnall@and.digital \
	npm run cdk deploy

build:
	REACT_APP_API_URL=https://vcokbff4qc.execute-api.eu-west-1.amazonaws.com/prod/ \
    npm run build


