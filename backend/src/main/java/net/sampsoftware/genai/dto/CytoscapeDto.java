package net.sampsoftware.genai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CytoscapeDto {
    private Elements elements;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Elements {
        private List<CytoscapeNode> nodes;
        private List<CytoscapeEdge> edges;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CytoscapeNode {
        private NodeData data;
        private String classes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NodeData {
        private String id;
        private String label;
        private String type;
        private Object details;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CytoscapeEdge {
        private EdgeData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EdgeData {
        private String id;
        private String source;
        private String target;
        private String label;
    }
}
