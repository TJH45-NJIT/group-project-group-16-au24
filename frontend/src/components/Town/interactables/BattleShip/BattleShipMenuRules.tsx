import { Button, Center, StackDivider, Text } from '@chakra-ui/react';
import React from 'react';

interface BattleShipMenuRulesProps {
  exitMenuCallback(): void;
}

export function BattleShipMenuRules({ exitMenuCallback }: BattleShipMenuRulesProps): JSX.Element {
  return (
    <StackDivider>
      <Center>
        <Text>Rules (to be added later)!</Text>
      </Center>
      <br />
      <Center>
        <Button onClick={exitMenuCallback}>Back</Button>
      </Center>
    </StackDivider>
  );
}
