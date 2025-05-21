package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.PersonRecord;
import net.sampsoftware.genai.model.Person;
import net.sampsoftware.genai.service.PersonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/people")
@RequiredArgsConstructor
public class PersonController {
    private final PersonService personService;

    @GetMapping
    public ResponseEntity<List<PersonRecord>> getAllPeople() {
        List<Person> people = personService.getAllPeople();
        List<PersonRecord> records = people.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonRecord> getPerson(@PathVariable Long id) {
        Person person = personService.getPerson(id);
        return ResponseEntity.ok(toRecord(person));
    }

    @PostMapping
    public ResponseEntity<PersonRecord> createPerson(@RequestBody PersonRecord record) {
        Person person = fromRecord(record);
        Person created = personService.createPerson(person);
        return ResponseEntity.ok(toRecord(created));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PersonRecord>> searchPeople(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String occupation) {

        List<Person> people;

        if (email != null && !email.isBlank()) {
            return personService.findByEmail(email)
                    .map(person -> ResponseEntity.ok(List.of(toRecord(person))))
                    .orElse(ResponseEntity.ok(List.of()));
        } else if (occupation != null && !occupation.isBlank()) {
            people = personService.findByOccupation(occupation);
        } else {
            people = personService.getAllPeople();
        }

        List<PersonRecord> records = people.stream()
                .map(this::toRecord)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    private PersonRecord toRecord(Person person) {
        return new PersonRecord(
                person.getId(),
                person.getName(),
                person.getEmail(),
                person.getBirthDate(),
                person.getOccupation(),
                person.getAttributes(),
                person.getCreatedAt(),
                person.getUpdatedAt()
        );
    }

    private Person fromRecord(PersonRecord record) {
        Person person = new Person();
        person.setName(record.name());
        person.setEmail(record.email());
        person.setBirthDate(record.birthDate());
        person.setOccupation(record.occupation());
        person.setAttributes(record.attributes());
        return person;
    }
}
