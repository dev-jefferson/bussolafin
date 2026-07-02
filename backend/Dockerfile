FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:21-jre-jammy AS extract
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar
RUN java -Djarmode=tools -jar app.jar extract --layers --destination extracted

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && addgroup --system spring && adduser --system --ingroup spring spring
COPY --from=extract /app/extracted/application/ ./
COPY --from=extract /app/extracted/dependencies/lib/ ./lib/
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
