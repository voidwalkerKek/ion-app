import { useEffect, useState } from "react";
import {
  Box,
  Center,
  Spinner,
  Image,
  Button,
  Flex,
  Heading,
  Tag,
  Spacer,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import { SetupStore } from "../../store/setup.store";

import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";

import socket from "../Dashboard/providers/socket.io";

const MAX_STEP = 3;

const StepView = {
  1: <Step1 />, // user credentials
  2: <Step2 />, // user authentication
  3: <Step3 />, // success
};

export default () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setupStore = SetupStore.useState((s) => s);

  const SetStep = (n) => {
    SetupStore.update((s) => {
      s.step = n;
    });
  };

  useEffect(() => {
    socket.on("get-phone-code", () => {
      setLoading(false);
      SetStep(2);
    });

    socket.on("get-password", () => {
      // todo: use chakra-ui modal to promt
      const password = prompt("Enter 2FA password:");
      socket.emit("password", password);
    });

    socket.on("error", (error) => {
      setError(error);
      setLoading(false);
    });

    socket.on("user-welcome", (data) => {
      setLoading(false);
      SetupStore.update((s) => {
        s.final = data;
      });
      SetStep(3);
    });
  }, []);

  const handleNext = () => {
    const { step } = setupStore;
    switch (step) {
      case 1:
        setLoading(true);
        socket.emit("user-data", setupStore.data);
        break;
      case 2:
        setLoading(true);
        socket.emit("phone-code", setupStore.data.phoneCode);
      case 3:
        break;
    }
  };

  const NavButtons = () => {
    let buttons = [];
    const { step } = setupStore;

    if (step < MAX_STEP) {
      buttons.push(
        <Button colorScheme="brand" onClick={handleNext}>
          Next
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Box pos="relative">
      <Center mt={{ base: 8, md: 16 }}>
        <Image src="/assets/ion-logo.png" w={24} />
      </Center>

      <Center mt={6} p={4}>
        <Box w={{ base: "full", md: "2xl" }} pos="relative">
          <Flex alignItems="center" p={4} rounded="lg" bg="gray.100">
            <Heading>🚀 Ion Setup</Heading>
            <Spacer />
            <Tag size="lg" colorScheme="brand">
              Step {setupStore.step} of {MAX_STEP}
            </Tag>
          </Flex>

          <Text p={4}>
            In dolore eiusmod incididunt dolore ipsum minim eu occaecat. Ea anim
            proident irure velit sint pariatur nisi culpa laborum nisi aute
            mollit occaecat elit.
          </Text>

          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Box p={4} bg="white">
            {loading ? (
              <Center>
                <Spinner />
              </Center>
            ) : (
              StepView[setupStore.step]
            )}
          </Box>

          <Center pos="absolute" right={4}>
            <HStack>{!loading && <NavButtons />}</HStack>
          </Center>
        </Box>
      </Center>
    </Box>
  );
};
