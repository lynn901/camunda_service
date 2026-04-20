# ====== Build Stage ======
FROM maven:3.9.5-eclipse-temurin-17 AS build-stage
WORKDIR /app

# 利用 Maven 依赖缓存：仅在 pom.xml 变化时重新下载
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 构建源码
COPY src ./src
RUN mvn clean package -DskipTests -B

# ====== Run Stage ======
FROM eclipse-temurin:17-jre

# 安装时区支持
RUN apt-get update && apt-get install -y tzdata \
    && ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app

# 复制生成的 jar
COPY --from=build-stage /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 生产环境 JVM 参数调优
ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Duser.timezone=Asia/Shanghai", \
  "-jar", "app.jar"]
