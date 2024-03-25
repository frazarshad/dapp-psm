/* eslint-disable ui-testing/no-disabled-tests */
describe('Swap Tokens Tests', () => {
  const limitFloat = float => parseFloat(float.toFixed(5));
  const amountToSwap = 0.001;
  const phrasesList = {
    emerynet: {
      walletButton: 'li[data-value="testnet"]',
      psmNetwork: 'Agoric Emerynet',
      token: 'ToyUSD',
    },
    local: {
      walletButton: 'li[data-value="local"]',
      psmNetwork: 'Local Network',
      token: 'USDC_axl',
    },
  };
  const networkPhrases = phrasesList[Cypress.env('AGORIC_NET')];

  it(`should connect with Agoric Chain on https;//wallet.agoric.app`, () => {
    cy.origin('https://wallet.agoric.app/', () => {
      cy.visit('/');
    });
    cy.acceptAccess().then(taskCompleted => {
      expect(taskCompleted).to.be.true;
    });

    cy.origin(
      'https://wallet.agoric.app/',
      { args: { networkPhrases } },
      ({ networkPhrases }) => {
        cy.visit('/wallet/');

        cy.get('input.PrivateSwitchBase-input').click();
        cy.contains('Proceed').click();

        cy.get('button[aria-label="Settings"]').click();

        cy.get('#demo-simple-select').click();
        cy.get(networkPhrases.walletButton).click();
        cy.contains('button', 'Connect').click();
      }
    );

    cy.acceptAccess().then(taskCompleted => {
      expect(taskCompleted).to.be.true;
    });
  });

  it('should connect with wallet', () => {
    cy.visit('/');

    // Switch to local network
    cy.get('button').contains('Agoric Mainnet').click();
    cy.get('button').contains(networkPhrases.psmNetwork).click();

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
    cy.get('button').contains(networkPhrases.token).click();
    cy.get('svg.transform.rotate-90').click();

    // Swap IST
    cy.get('input[type="number"]').first().type(amountToSwap);
    cy.get('button').contains('Swap').click();

    // Confirm transactions
    cy.confirmTransaction();
    cy.get('div')
      .contains('Swap Completed', { timeout: 60000 })
      .should('be.visible');

    cy.getTokenAmount('IST').then(amount =>
      expect(amount).to.equal(limitFloat(ISTbalance - amountToSwap))
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
    cy.get('button').contains(networkPhrases.token).click();

    // Swap USDC_axl
    cy.get('input[type="number"]').first().type(amountToSwap);
    cy.get('button').contains('Swap').click();

    // Confirm transactions
    cy.confirmTransaction();
    cy.get('div')
      .contains('Swap Completed', { timeout: 60000 })
      .should('be.visible');

    cy.getTokenAmount('IST').then(amount =>
      expect(amount).to.equal(limitFloat(ISTbalance + amountToSwap))
    );
  });
});
