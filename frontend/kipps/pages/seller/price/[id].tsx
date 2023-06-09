import { 
    Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, Select,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import DateTimePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../../components/Header';
import { ChainId, useAddress, useChainId} from '@thirdweb-dev/react';
const { utils, Contract, ethers } = require('ethers');
import abiTicketJson from '../../../abi/ticket.json';

const PriceSettingContent = () => {
    const address = useAddress();
    const contractAddress='0x4C874CCacA16f482b872Cb323174bc0D3636E3Bb';
    const contractAbi=abiTicketJson.abi;

    const router = useRouter();
    const [feeAddress, setFeeAddress] = useState('0x326C977E6efc84E512bB9C30f76E30c160eD06FB');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('0x66e69CF6d7ebE2B4974d251323d43DC724292a0b');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [eventDate, setEventDate] = useState<Date | null>(null);

    //Control Modal
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);

    const { id } = router.query;

    const handleFeeAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {setFeeAddress(event.target.value)};
    const handlePriceChange = (value: string) => {setPrice(Number(value));};
    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {setCategory(event.target.value);};
    const handleStartDateChange = (date: Date | null) => {setStartDate(date);};
    const handleEndDateChange = (date: Date | null) => {setEndDate(date);};
    const handleEventDateChange = (date: Date | null) => {setEventDate(date);};

    const handleSubmit = async() => {
        if (!startDate || !endDate || !eventDate) {
            return;
        }

        const timestampStart = startDate.getTime() / 1000;
        const timestampEnd = endDate.getTime() / 1000;
        const timestampEvent = eventDate.getTime() / 1000;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log(timestampStart)
        try {
            const tokenABI = [
                {
                    "inputs": [
                      {
                        "internalType": "uint256",
                        "name": "_ticketId",
                        "type": "uint256"
                      },
                      {
                        "internalType": "address",
                        "name": "_feeAddress",
                        "type": "address"
                      },
                      {
                        "internalType": "uint256",
                        "name": "_feeAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "_startTime",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "_endTime",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "_eventTime",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "_mintLimit",
                        "type": "uint256"
                      },
                      {
                        "internalType": "address",
                        "name": "_oracleAddress",
                        "type": "address"
                      }
                    ],
                    "name": "setTicket",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                  }
              ];
            setLoading(true);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                contractAddress,
                tokenABI,
                signer
            );
            console.log(category)
            const tx = await contract.setTicket(
                id,
                feeAddress,
                price,
                timestampStart,
                timestampEnd,
                timestampEvent,
                100,
                category
            ); 
            await tx.wait();
            onOpen();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box padding={4} backgroundColor='#F2F1EF'>
            <form onSubmit={handleSubmit}>
                <FormControl marginBottom={4}>
                    <FormLabel>Name</FormLabel>
                    <Input value={feeAddress} onChange={handleFeeAddressChange} backgroundColor='white' />
                </FormControl>
                <FormControl marginBottom={4}>
                    <FormLabel>Price</FormLabel>
                    <NumberInput value={price} onChange={handlePriceChange} precision={2} step={0.01} min={0} backgroundColor='white'>
                        <NumberInputField />
                    </NumberInput>
                </FormControl>
                <FormControl marginBottom={4}>
                    <FormLabel>Optional Setting</FormLabel>
                    <Select value={category} onChange={handleCategoryChange} backgroundColor='white'>
                        <option value='0x66e69CF6d7ebE2B4974d251323d43DC724292a0b'>Rainy Cash Back</option>
                        <option value='0xbf7c75051D0bc36f8B55fD534B1a4f25C485117F'>Rainy NFT</option>
                        <option value='category3'>Premium NFT(coming soon...)</option>
                    </Select>
                </FormControl>

                <FormControl marginBottom={4}>
                    <FormLabel>Start Date</FormLabel>
                    <DateTimePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        dateFormat='yyyy/MM/dd HH:mm:ss'
                        timeFormat='HH:mm:ss'
                        showTimeSelect
                        timeIntervals={1}
                        timeCaption='Start Date'
                    />
                    </FormControl>

                <FormControl marginBottom={4}>
                    <FormLabel>End Date</FormLabel>
                    <DateTimePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        dateFormat='yyyy/MM/dd HH:mm:ss'
                        timeFormat='HH:mm:ss'
                        showTimeSelect
                        timeIntervals={1}
                        timeCaption='End Date'
                    />
                </FormControl>

                <FormControl marginBottom={4}>
                <FormLabel>Event Date</FormLabel>
                <DateTimePicker
                    selected={eventDate}
                    onChange={handleEventDateChange}
                    dateFormat='yyyy/MM/dd HH:mm:ss'
                    timeFormat='HH:mm:ss'
                    showTimeSelect
                    timeIntervals={1}
                    timeCaption='Event Date'
                />
                </FormControl>

                <Button isLoading={loading} loadingText="Loading..." backgroundColor='#8C7370' color='white' onClick={handleSubmit}>
                    Register Ticket
                </Button>
            </form>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Minting Complete</ModalHeader>
                        <ModalBody>
                            Your mint transaction has been successfully completed.
                        </ModalBody>
                        <ModalFooter>
                            <Button backgroundColor='#8C7370' color='white' onClick={()=>router.push(`/`)}>
                                Close
                            </Button>
                        </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

const PriceSetting = () => {
    const router = useRouter();
    return (
        <Box>
            <Header />
            <PriceSettingContent />
        </Box>
    )
}

export default PriceSetting;
