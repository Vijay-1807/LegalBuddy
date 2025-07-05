// Footer.jsx
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  padding: 1rem;
  background-color: transparent;
  color: var(--dark-text-secondary, #a0a0a0);
  font-size: 14px;
  text-align: center;
  margin-top: auto;
  transition: color 0.3s;

  .light-theme & {
    color: var(--light-text-secondary, #6c757d);
  }

  @media (max-width: 600px) {
    font-size: 12px;
    padding: 0.75rem;
  }
`;

const FooterLink = styled.a`
  color: #00aaff;
  font-weight: bold;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.3s ease;

  &:hover {
    color: #ffffff;
    text-decoration: underline;
  }

  .light-theme &:hover {
    color: #0056b3;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      © 2025
      <FooterLink href="#">
        Legal Buddy
      </FooterLink>{' '}
      . All rights reserved.
    </FooterContainer>
  );
};

export default Footer;
