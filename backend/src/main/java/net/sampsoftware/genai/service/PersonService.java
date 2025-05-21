package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.model.Person;
import net.sampsoftware.genai.repository.PersonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PersonService {
    private final PersonRepository personRepository;

    @Transactional
    public Person createPerson(Person person) {
        return personRepository.save(person);
    }

    @Transactional(readOnly = true)
    public List<Person> getAllPeople() {
        return personRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Person getPerson(Long id) {
        return personRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Person not found: " + id));
    }

    @Transactional(readOnly = true)
    public Optional<Person> findByEmail(String email) {
        return personRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<Person> findByOccupation(String occupation) {
        return personRepository.findByOccupation(occupation);
    }
}
