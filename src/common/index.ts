import { NUMERICAL } from "../constants";

function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomIndicesArray(min: number, max: number, numberOfIndices : number = NUMERICAL.THREE): number[] {
    
    const randomIndices: number[] = [];
    while (randomIndices.length < numberOfIndices) {
        const randomIndex = getRandomNumber(min, max);

        // Ensure that the generated index is not already in the array
        if (!randomIndices.includes(randomIndex)) {
            randomIndices.push(randomIndex);
        }
    }

    return randomIndices;
}

// get date time Difference
const getTimeDifference = (startTime: Date, endTime: Date) => {
    const oldTime: any = new Date(startTime);
    const currentTime: any = new Date(endTime);

    const diff = currentTime - oldTime;
    const difftime = Math.round(diff / NUMERICAL.THOUSAND); // send time In Secound

    return difftime;
};

const exportObject = {
    getRandomNumber,
    getRandomIndicesArray,
    getTimeDifference
}

export = exportObject;
