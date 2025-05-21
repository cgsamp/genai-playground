package net.sampsoftware.genai.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Utility class for working with JSONB attributes
 */
@Component
@RequiredArgsConstructor
public class JsonAttributeUtil {
    private final ObjectMapper objectMapper;

    /**
     * Add or update a field in a JsonNode
     */
    public JsonNode setField(JsonNode node, String field, Object value) {
        ObjectNode objectNode = node != null && node.isObject()
                ? (ObjectNode) node
                : objectMapper.createObjectNode();

        objectNode.set(field, objectMapper.valueToTree(value));
        return objectNode;
    }

    /**
     * Get a field from a JsonNode as a specific type
     */
    public <T> T getField(JsonNode node, String field, Class<T> type) {
        if (node == null || !node.has(field)) {
            return null;
        }

        try {
            return objectMapper.treeToValue(node.get(field), type);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting JSON field", e);
        }
    }

    /**
     * Check if a JsonNode has a specific field
     */
    public boolean hasField(JsonNode node, String field) {
        return node != null && node.has(field);
    }

    /**
     * Remove a field from a JsonNode
     */
    public JsonNode removeField(JsonNode node, String field) {
        if (node == null || !node.isObject()) {
            return node;
        }

        ObjectNode objectNode = (ObjectNode) node;
        objectNode.remove(field);
        return objectNode;
    }

    /**
     * Convert a Java object to a JsonNode
     */
    public JsonNode toJsonNode(Object value) {
        return objectMapper.valueToTree(value);
    }

    /**
     * Convert a JsonNode to a Java object
     */
    public <T> T fromJsonNode(JsonNode node, Class<T> type) {
        try {
            return objectMapper.treeToValue(node, type);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting from JSON", e);
        }
    }
}
