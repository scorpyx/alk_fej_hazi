# Docker image buildelése
docker image build -t scorpyx/restaurant:v1 .

# Docker image futtatása

## Hálózat elkészítése a container-ek számára

docker network create -d bridge my-net

## Mongo DB futtatása

docker run --network=my-net --name mongo -d mongo:noble

## Restaurant image futtatása

docker run --network=my-net -p 8000:8000 --name restaurant -d scorpyx/restaurant:v1