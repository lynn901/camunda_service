# ====== Build Stage ======
FROM maven:3.9.5-eclipse-temurin-17 AS build-stage
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ====== Run Stage ======
FROM eclipse-temurin:17-jre-jammy

# 安装必要工具（curl 用于健康检查脚本）
RUN apt-get update && apt-get install -y tzdata curl && rm -rf /var/lib/apt/lists/*

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 创建非 root 运行用户（安全最佳实践）
RUN groupadd -r appgroup && useradd -m -r -g appgroup appuser

WORKDIR /app

# 从构建阶段复制生成的 jar 文件
COPY --from=build-stage /app/target/*.jar app.jar

# 修改文件所有者
RUN chown appuser:appgroup app.jar

USER appuser

# 暴露应用端口
EXPOSE 8080

# 健康检查：每 30 秒检测一次，启动等待 60 秒
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM 参数优化：限制堆内存，打印 GC 日志，设置时区
ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Duser.timezone=Asia/Shanghai", \
  "-jar", "app.jar"]
