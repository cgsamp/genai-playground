package net.sampsoftware.genai.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "model_calls")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_configuration_id")
    private ModelConfiguration modelConfiguration;

    /**
     * Snapshot of model configuration at execution time
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "model_configuration_json", columnDefinition = "jsonb")
    private JsonNode modelConfigurationJson;

    @Column(name = "provider")
    private String provider;

    /**
     * Human-readable prompt text combining system, user, and other prompt components
     */
    @Column(name = "prompt_text", columnDefinition = "text")
    private String promptText;

    /**
     * Complete prompt structure including all Spring AI Prompt object data
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "prompt_json", columnDefinition = "jsonb")
    private JsonNode promptJson;

    /**
     * Raw response content as returned by the model
     */
    @Column(name = "response_text", columnDefinition = "text")
    private String responseText;

    /**
     * Complete ChatResponse object data including metadata
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_json", columnDefinition = "jsonb")
    private JsonNode responseJson;

    /**
     * Token usage statistics from the response
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "token_usage", columnDefinition = "jsonb")
    private JsonNode tokenUsage;

    /**
     * Complete ChatOptions object including all provider-specific options
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "chat_options", columnDefinition = "jsonb")
    private JsonNode chatOptions;

    /**
     * Additional metadata from the request/response cycle
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private JsonNode metadata;

    // Changed: Now has NOT NULL DEFAULT false in schema
    @Builder.Default
    @Column(name = "success", nullable = false)
    private Boolean success = false;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "error_class")
    private String errorClass;

    /**
     * Stack trace for debugging failures
     */
    @Column(name = "error_stacktrace", columnDefinition = "text")
    private String errorStacktrace;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "api_duration_ms")
    private Long apiDurationMs;

    @Column(name = "processing_duration_ms")
    private Long processingDurationMs;

    @Column(name = "batch_id")
    private Long batchId;

    // Changed: Now NOT NULL in schema, so ensure it's always set
    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    /**
     * Model name at time of execution (denormalized for easier querying)
     */
    @Column(name = "model_name")
    private String modelName;

    /**
     * Model provider at time of execution (denormalized for easier querying)
     */
    @Column(name = "model_provider")
    private String modelProvider;

    /**
     * Request correlation ID for tracing across services
     */
    @Column(name = "correlation_id")
    private String correlationId;

    /**
     * User/session identifier if available
     */
    @Column(name = "user_id")
    private String userId;

    /**
     * Request source/context (e.g., "batch_summary", "chat", "operations")
     */
    @Column(name = "request_context")
    private String requestContext;
}
