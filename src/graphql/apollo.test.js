import apollo from './apollo';

it('exports a graphql client', () => {
  expect(apollo.query).toBeInstanceOf(Function);
  expect(apollo.mutate).toBeInstanceOf(Function);
});
