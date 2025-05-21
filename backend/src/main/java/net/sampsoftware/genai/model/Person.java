package net.sampsoftware.genai.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "people")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Person extends BaseEntity {
    private String email;
    private LocalDate birthDate;
    private String occupation;
}
