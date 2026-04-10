FROM python:3.13.13-trixie
COPY restaurants.json .
COPY restaurant_table_reservation.py .
COPY pyproject.toml .
RUN pip install .
CMD ["uwsgi", "--http", "0.0.0.0:8000", "-w", "restaurant_table_reservation:app"]