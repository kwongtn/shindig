import { ExtractDomainPipe } from "../extract-domain.pipe";

describe("ExtractDomainPipe", () => {
    it("create an instance", () => {
        const pipe = new ExtractDomainPipe();
        expect(pipe).toBeTruthy();
    });
});
