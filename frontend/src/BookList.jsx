// BookList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BookList() {
  const [books, setBooks] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/api/books')
      .then(res => {
        const books = res.data;
        setBooks(books);

        const bookIds = books.map(book => book.id).join(',');
        return axios.get(`http://localhost:8080/api/summaries?entity=ranked_books&entityIds=${bookIds}`);
      })
      .then(res => setSummaries(res.data))
      .catch(err => {
        console.error('Error loading books or summaries:', err);
        setError('Failed to load books');
      });
  }, []);

  function getSummariesForBook(bookId) {
    return summaries.filter(s => s.entityId === bookId);
  }

  if (error) return <div>{error}</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Title</th>
          <th>Author</th>
          <th>Year</th>
          <th>Source</th>
          <th>Summaries</th>
        </tr>
      </thead>
      <tbody>
        {books.map(book => (
          <tr key={book.id}>
            <td>{book.rank}</td>
            <td>{book.title}</td>
            <td>{book.authorName}</td>
            <td>{book.publishYear}</td>
            <td>{book.source?.orgName}</td>
            <td>
              <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                {getSummariesForBook(book.id).map(summary => (
                  <li key={summary.id}>
                    <strong>{summary.modelName}</strong> — {new Date(summary.createdAt).toLocaleString()}<br/>
                    {summary.summary}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BookList;
