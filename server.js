const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} = require('graphql');
const cors = require('cors');

const app = express();
app.use(cors());

const publishers = [
  { id: 1, name: 'Pragma' },
  { id: 2, name: 'Melvil' },
];

const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' },
];

const books = [
  { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1, publisherId: 1 },
  { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1, publisherId: 1 },
  { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1, publisherId: 2 },
  { id: 4, name: 'The Fellowship of the Ring', authorId: 2, publisherId: 1 },
  { id: 5, name: 'The Two Towers', authorId: 2, publisherId: 2 },
  { id: 6, name: 'The Return of the King', authorId: 2, publisherId: 2 },
  { id: 7, name: 'The Way of Shadows', authorId: 3, publisherId: 2 },
  { id: 8, name: 'Beyond the Shadows', authorId: 3, publisherId: 1 },
];

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    publisherId: { type: GraphQLNonNull(PublisherType) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
    publisher: {
      type: PublisherType,
      resolve: (book) => {
        return publishers.find((publisher) => publisher.id === book.publisherId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of books',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

const PublisherType = new GraphQLObjectType({
  name: 'Publisher',
  description: 'This represents a publisher',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (publisher) => {
        return books.filter((book) => book.publisherId === publisher.id);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'Get book',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    author: {
      type: AuthorType,
      description: 'Get author',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => authors.find((author) => author.id === args.id),
    },
    publisher: {
      type: PublisherType,
      description: 'Get publisher',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => publishers.find((publisher) => publisher.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'Get all books',
      resolve: () => books, // db query goes here
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'Get all authors',
      resolve: () => authors,
    },
    publishers: {
      type: new GraphQLList(PublisherType),
      description: 'Get all publishers',
      resolve: () => publishers,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add a book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
    addPublisher: {
      type: PublisherType,
      description: 'Add a publisher',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const publisher = {
          id: publishers.length + 1,
          name: args.name,
        };

        publishers.push(publisher);
        return publisher;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  '/graphql',
  expressGraphQL({
    graphiql: true,
    schema: schema,
  })
);
app.listen(5000, () => console.log('Server running'));
