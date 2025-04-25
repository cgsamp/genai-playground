package net.sampsoftware.genai.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "book_rank_source")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BookRankSource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orgName;
    private LocalDate publishDate;

    @OneToMany(mappedBy = "source", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<RankedBook> rankedBooks;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrgName() { return orgName; }
    public void setOrgName(String orgName) { this.orgName = orgName; }
    public LocalDate getPublishDate() { return publishDate; }
    public void setPublishDate(LocalDate publishDate) { this.publishDate = publishDate; }
    public List<RankedBook> getRankedBooks() { return rankedBooks; }
    public void setRankedBooks(List<RankedBook> rankedBooks) { this.rankedBooks = rankedBooks; }
}
