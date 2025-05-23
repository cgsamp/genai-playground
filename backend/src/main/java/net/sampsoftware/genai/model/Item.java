package net.sampsoftware.genai.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Generic item model that represents any type of item in the system
 * Replaces separate Book, Person, RankedBook, etc. models
 */
@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_type", nullable = false, length = 100)
    private String itemType;

    @Column(name = "name", nullable = false, length = 500)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "creator", length = 255)
    private String creator;

    @Column(name = "created_year", length = 10)
    private String createdYear;

    @Column(name = "external_id", length = 255)
    private String externalId;

    @Column(name = "source", length = 255)
    private String source;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes", columnDefinition = "jsonb")
    @Builder.Default
    private JsonNode attributes = JsonNodeFactory.instance.objectNode();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // === CONVENIENCE METHODS FOR COMMON ATTRIBUTES ===

    /**
     * Get a type-safe attribute value
     */
    public <T> T getAttribute(String key, Class<T> type, T defaultValue) {
        try {
            if (attributes == null || !attributes.has(key)) {
                return defaultValue;
            }
            JsonNode node = attributes.get(key);
            if (node.isNull()) {
                return defaultValue;
            }

            // Handle different types
            if (type == String.class) {
                return type.cast(node.asText());
            } else if (type == Integer.class) {
                return type.cast(node.asInt());
            } else if (type == Long.class) {
                return type.cast(node.asLong());
            } else if (type == Double.class) {
                return type.cast(node.asDouble());
            } else if (type == Boolean.class) {
                return type.cast(node.asBoolean());
            }

            return defaultValue;
        } catch (Exception e) {
            return defaultValue;
        }
    }

    /**
     * Set an attribute value
     */
    public void setAttribute(String key, Object value) {
        if (attributes == null) {
            attributes = JsonNodeFactory.instance.objectNode();
        }

        if (attributes.isObject()) {
            com.fasterxml.jackson.databind.node.ObjectNode objectNode =
                    (com.fasterxml.jackson.databind.node.ObjectNode) attributes;

            if (value == null) {
                objectNode.putNull(key);
            } else if (value instanceof String) {
                objectNode.put(key, (String) value);
            } else if (value instanceof Integer) {
                objectNode.put(key, (Integer) value);
            } else if (value instanceof Long) {
                objectNode.put(key, (Long) value);
            } else if (value instanceof Double) {
                objectNode.put(key, (Double) value);
            } else if (value instanceof Boolean) {
                objectNode.put(key, (Boolean) value);
            } else {
                objectNode.put(key, value.toString());
            }
        }
    }

    // === ITEM TYPE SPECIFIC CONVENIENCE METHODS ===

    /**
     * For book items - get rank
     */
    public Integer getRank() {
        return getAttribute("rank", Integer.class, null);
    }

    public void setRank(Integer rank) {
        setAttribute("rank", rank);
    }

    /**
     * For book items - get ISBN
     */
    public String getIsbn() {
        return getAttribute("isbn", String.class, null);
    }

    public void setIsbn(String isbn) {
        setAttribute("isbn", isbn);
    }

    /**
     * For person items - get email
     */
    public String getEmail() {
        return getAttribute("email", String.class, null);
    }

    public void setEmail(String email) {
        setAttribute("email", email);
    }

    /**
     * For person items - get occupation
     */
    public String getOccupation() {
        return getAttribute("occupation", String.class, null);
    }

    public void setOccupation(String occupation) {
        setAttribute("occupation", occupation);
    }

    /**
     * For movie items - get IMDB ID
     */
    public String getImdbId() {
        return getAttribute("imdb_id", String.class, null);
    }

    public void setImdbId(String imdbId) {
        setAttribute("imdb_id", imdbId);
    }

    /**
     * For movie items - get director
     */
    public String getDirector() {
        return getCreator(); // Director is stored in creator field
    }

    public void setDirector(String director) {
        setCreator(director);
    }

    /**
     * For academic paper items - get DOI
     */
    public String getDoi() {
        return getAttribute("doi", String.class, null);
    }

    public void setDoi(String doi) {
        setAttribute("doi", doi);
    }

    /**
     * For academic paper items - get journal
     */
    public String getJournal() {
        return getAttribute("journal", String.class, null);
    }

    public void setJournal(String journal) {
        setAttribute("journal", journal);
    }

    // === DISPLAY HELPERS ===

    /**
     * Get a human-readable display name
     */
    public String getDisplayName() {
        if (name == null || name.trim().isEmpty()) {
            return String.format("%s #%d", capitalizeItemType(itemType), id);
        }
        return name;
    }

    /**
     * Get item details for display
     */
    public String getDisplayDetails() {
        StringBuilder details = new StringBuilder();

        if (creator != null && !creator.trim().isEmpty()) {
            details.append("By: ").append(creator);
        }

        if (createdYear != null && !createdYear.trim().isEmpty()) {
            if (details.length() > 0) details.append(", ");
            details.append("Year: ").append(createdYear);
        }

        // Add type-specific details
        switch (itemType.toLowerCase()) {
            case "book":
            case "ranked_book":
                Integer rank = getRank();
                if (rank != null) {
                    if (details.length() > 0) details.append(", ");
                    details.append("Rank: ").append(rank);
                }
                break;

            case "person":
                String occupation = getOccupation();
                if (occupation != null) {
                    if (details.length() > 0) details.append(", ");
                    details.append("Occupation: ").append(occupation);
                }
                break;

            case "movie":
                String imdbId = getImdbId();
                if (imdbId != null) {
                    if (details.length() > 0) details.append(", ");
                    details.append("IMDB: ").append(imdbId);
                }
                break;
        }

        return details.length() > 0 ? details.toString() : null;
    }

    private String capitalizeItemType(String itemType) {
        if (itemType == null || itemType.isEmpty()) return "Item";

        String[] parts = itemType.toLowerCase().split("[_\\s]+");
        StringBuilder result = new StringBuilder();

        for (String part : parts) {
            if (result.length() > 0) result.append(" ");
            result.append(part.substring(0, 1).toUpperCase())
                    .append(part.substring(1));
        }

        return result.toString();
    }
}
