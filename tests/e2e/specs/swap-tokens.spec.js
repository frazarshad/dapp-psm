/* eslint-disable ui-testing/no-disabled-tests */
describe('Swap Tokens Tests', () => {
  it(`should connect with Agoric Chain on https;//wallet.agoric.app`, () => {
    cy.origin('https://wallet.agoric.app/', () => {
      cy.visit('/');
    });
    cy.acceptAccess().then(taskCompleted => {
      expect(taskCompleted).to.be.true;
    });

    cy.origin('https://wallet.agoric.app/', () => {
      cy.visit('/wallet/');

      cy.get('input.PrivateSwitchBase-input').click();
      cy.contains('Proceed').click();

      cy.get('button[aria-label="Settings"]').click();

      cy.get('#demo-simple-select').click();
      cy.get('li[data-value="local"]').click();
      cy.contains('button', 'Connect').click();
    });

    cy.acceptAccess().then(taskCompleted => {
      expect(taskCompleted).to.be.true;
    });
  });

  it('should connect with wallet', () => {
    cy.visit('/');

    // Switch to local network
    cy.get('button').contains('Agoric Mainnet').click();
    cy.get('button').contains('Local Network').click();

    // Click the connect button
    cy.get('button').contains('Connect Keplr').click();
    cy.get('input[type="checkbox"]').click();
    cy.get('button:enabled').contains('Proceed').click();

    // Accept access and confirm
    cy.acceptAccess();
    cy.get('button').contains('Keplr Connected').should('be.visible');
  });

  it('should swap tokens from IST to stable', () => {
    let ISTbalance;

    // Connect wallet
    cy.visit('/');
    cy.get('button').contains('Connect Keplr').click();

    cy.addNewTokensFound();
    cy.getTokenAmount('IST').then(amount => (ISTbalance = amount));

    // Select asset and swap positions
    cy.get('button').contains('Select asset').click();
    cy.get('button').contains('USDC_axl').click();
    cy.get('svg.transform.rotate-90').click();

    // Swap 1 IST
    cy.get('input[type="number"]').first().type(1);
    cy.get('button').contains('Swap').click();

    // Confirm transactions
    cy.confirmTransaction();
    cy.get('div').contains('Swap Completed').should('be.visible');

    cy.getTokenAmount('IST').then(amount =>
      expect(amount).to.equal(ISTbalance - 1)
    );
  });

  it('should swap tokens from stable to IST', () => {
    let ISTbalance;

    // Connect wallet
    cy.visit('/');
    cy.get('button').contains('Connect Keplr').click();

    cy.getTokenAmount('IST').then(amount => (ISTbalance = amount));

    // Select asset
    cy.get('button').contains('Select asset').click();
    cy.get('button').contains('USDC_axl').click();

    // Swap 1 USDC_axl
    cy.get('input[type="number"]').first().type(1);
    cy.get('button').contains('Swap').click();

    // Confirm transactions
    cy.confirmTransaction();
    cy.get('div').contains('Swap Completed').should('be.visible');

    cy.getTokenAmount('IST').then(amount =>
      expect(amount).to.equal(ISTbalance + 1)
    );
  });
});
