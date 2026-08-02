# --- Build stage ---
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /build

COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw clean package -DskipTests -B

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S opspilot && adduser -S opspilot -G opspilot
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
RUN chown opspilot:opspilot app.jar
USER opspilot

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]