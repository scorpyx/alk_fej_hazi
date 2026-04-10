# Docker image buildelése

docker image build -t scorpyx/restaurant-ui:v1 .

# Docker image futtatása

## Előfeltételek

Inditsd el a Mongo DB-t és a backend-et a backend README.md-ben leírtak alapján

## Restaurant-ui image futtatása

docker run --network=my-net -p 8000:8000 --name restaurant-ui -d scorpyx/restaurant-ui:v1