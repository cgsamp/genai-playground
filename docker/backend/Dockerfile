FROM maven:3.9.6-eclipse-temurin-21

# Set working directory
WORKDIR /app

# Copy pom.xml first for better layer caching
COPY backend/pom.xml ./

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY backend/src ./src

# Default command to compile
CMD ["mvn", "clean", "compile"]