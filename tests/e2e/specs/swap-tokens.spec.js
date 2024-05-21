/* eslint-disable ui-testing/no-disabled-tests */
import { DEFAULT_TIMEOUT, phrasesList } from '../utils';

describe('Swap Tokens Tests', () => {
  const limitFloat = float => parseFloat(float.toFixed(5));
  const amountToSwap = 0.001;
  const transactionFee = 0.2;
  const walletAddress = {
    value: null,
  };
  const networkPhrases = phrasesList[Cypress.env('AGORIC_NET')];
  const customWalletPhrase = Cypress.env('MNEMONIC_PHRASE');

  it('should setup wallet for test', () => {
    if (customWalletPhrase) {
      cy.setupWallet({
        secretWords: customWalletPhrase,
      });
    } else if (networkPhrases.isLocal) {
      cy.setupWallet();
    } else {
      cy.setupWallet({
        createNewWallet: true,
        walletName: 'my created wallet',
        selectedChains: ['Agoric'],
      });

      cy.getWalletAddress('Agoric').then(
        address => (walletAddress.value = address)
      );

      // Provision IST for wallet
      cy.origin(
        'https://emerynet.faucet.agoric.net',
        { args: { walletAddress, DEFAULT_TIMEOUT } },
        ({ walletAddress, DEFAULT_TIMEOUT }) => {
          cy.visit('/');
          cy.get('[id="address"]').first().type(walletAddress.value);
          cy.get('[type="radio"][value="client"]').click();
          cy.get('[name="clientType"]').select('REMOTE_WALLET');

          cy.get('[type="submit"]').first().click();
          cy.get('body')
            .contains('success', { timeout: DEFAULT_TIMEOUT })
            .should('exist');
        }
      );
    }
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
    let istBalance;

    // Connect wallet
    cy.visit('/');
    cy.get('button').contains('Connect Keplr').click();

    cy.addNewTokensFound();
    cy.getTokenAmount('IST').then(amount => (istBalance = amount));

    // Select asset and swap positions
    cy.get('button').contains('Select asset').click();
    cy.get('button').contains(networkPhrases.token).click();
    cy.get('svg.transform.rotate-90').click();

    // Swap token
    cy.get('input[type="number"]').first().type(amountToSwap);
    cy.get('button').contains('Swap').click();

    // Should show dialog for wallet provision
    let provisionFee = 0;
    if (!customWalletPhrase && !networkPhrases.isLocal) {
      cy.contains('h3', 'Smart Wallet Required').should('exist');
      cy.contains('button', 'Proceed').click();
      provisionFee = 0.75;
    }

    // Confirm transactions
    cy.confirmTransaction();
    cy.get('div')
      .contains('Swap Completed', { timeout: DEFAULT_TIMEOUT })
      .should('be.visible');

    cy.getTokenAmount('IST').then(amount =>
      expect(amount).to.be.oneOf([
        limitFloat(istBalance - amountToSwap - provisionFee),
        limitFloat(istBalance - amountToSwap - provisionFee - transactionFee),
      ])
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

    // Swap token
    cy.get('input[type="number"]').first().type(amountToSwap);
    cy.get('button').contains('Swap').click();

    // Confirm transactions
    cy.confirmTransaction();
    cy.get('div')
      .contains('Swap Completed', { timeout: DEFAULT_TIMEOUT })
      .should('be.visible');

    cy.getTokenAmount('IST').then(amount =>
      expect(amount).to.be.oneOf([
        limitFloat(ISTbalance + amountToSwap),
        limitFloat(ISTbalance + amountToSwap - transactionFee),
      ])
    );
  });
});
