import { CLIENTPage } from './app.po';

describe('client App', function() {
  let page: CLIENTPage;

  beforeEach(() => {
    page = new CLIENTPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
