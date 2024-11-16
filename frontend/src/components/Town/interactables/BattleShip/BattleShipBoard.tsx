import { Table, Td, Tr } from '@chakra-ui/react';
import React from 'react';

function Cell(): JSX.Element {
  return <Td borderWidth={3} borderColor={'black'} padding={5}></Td>;
}

function Row(): JSX.Element {
  return (
    <Tr borderWidth={3}>
      <Cell />
      <Cell />
      <Cell />
      <Cell />
      <Cell />
      <Cell />
      <Cell />
      <Cell />
      <Cell />
      <Cell />
    </Tr>
  );
}

export function BattleShipBoard(): JSX.Element {
  return (
    <Table
      marginLeft={'auto'}
      marginRight={'auto'}
      __css={{ 'table-layout': 'fixed' }}
      overflow={'hidden'}>
      <Row />
      <Row />
      <Row />
      <Row />
      <Row />
      <Row />
      <Row />
      <Row />
      <Row />
      <Row />
    </Table>
  );
}
