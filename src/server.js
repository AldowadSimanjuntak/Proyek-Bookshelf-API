// Import Hapi framework
const Hapi = require('@hapi/hapi');

// Buat  a new Hapi server 
const server = Hapi.server({
  port: 9000, // Port sesuai submission
  host: 'localhost',
});

// Dummy data for books
const books = [];

// Route to add a book
server.route({
  method: 'POST',
  path: '/books',
  handler: async (request, h) => {
    const { payload } = request;

    if (!payload.name) {
      return h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      }).code(400);
    }

    if (payload.readPage > payload.pageCount) {
      return h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      }).code(400);
    }

    // Dynamic import nanoid
    const { nanoid } = await import('nanoid');
    const id = nanoid();
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = payload.pageCount === payload.readPage;
    const newBook = { ...payload, id, insertedAt, updatedAt, finished };
    books.push(newBook);

    return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    }).code(201);
  },
});

// Route to get all books
server.route({
  method: 'GET',
  path: '/books',
  handler: (request, h) => {
    return h.response({
      status: 'success',
      data: {
        books: books.map(({ id, name, publisher }) => ({ id, name, publisher })),
      },
    });
  },
});

// Route to get book by ID
server.route({
  method: 'GET',
  path: '/books/{bookId}',
  handler: (request, h) => {
    const { bookId } = request.params;
    const book = books.find((b) => b.id === bookId);

    if (!book) {
      return h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: {
        book,
      },
    });
  },
});

// Route to update book by ID
server.route({
  method: 'PUT',
  path: '/books/{bookId}',
  handler: (request, h) => {
    const { bookId } = request.params;
    const { payload } = request;
    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex === -1) {
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      }).code(404);
    }

    if (!payload.name) {
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      }).code(400);
    }

    if (payload.readPage > payload.pageCount) {
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      }).code(400);
    }

    const updatedAt = new Date().toISOString();
    const finished = payload.pageCount === payload.readPage;
    const updatedBook = { ...books[bookIndex], ...payload, updatedAt, finished };
    books[bookIndex] = updatedBook;

    return h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
  },
});

// Route to delete book by ID
server.route({
  method: 'DELETE',
  path: '/books/{bookId}',
  handler: (request, h) => {
    const { bookId } = request.params;
    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex === -1) {
      return h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      }).code(404);
    }

    books.splice(bookIndex, 1);

    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
  },
});

// Mulai server
const init = async () => {
  await server.start();
  console.log(`Server is running at ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();