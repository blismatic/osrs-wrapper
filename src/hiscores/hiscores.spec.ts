import { request } from 'gaxios';
import { mockHiscoreCsv } from '../../test/hiscore-csv.mock';
import { mockBossHiscores, mockMinigameHiscores, mockSkillHiscores } from '../../test/parsed-hiscores.mock';
import { HiscoreTypes } from './hiscore-types.enum';
import { getHiscores } from './hiscores.module';

jest.mock('gaxios');

describe('Hiscores', () => {
    describe('getHiscores', () => {
        const playerName = 'Bald';
        const mockedSuccessfulResponse = { data: mockHiscoreCsv } as any;
        let mockedGaxiosRequest = request as jest.MockedFunction<typeof request>;

        mockedGaxiosRequest.mockResolvedValue(mockedSuccessfulResponse);

        afterEach(() => mockedGaxiosRequest.mockClear());
        afterAll(() => jest.unmock('gaxios'));

        it('should make a GET request', async () => {
            await getHiscores(playerName);

            expect(mockedGaxiosRequest.mock.calls[0][0]).toMatchObject({
                method: 'GET'
            });
        });

        it('should make a request with the passed in player name', async () => {
            await getHiscores(playerName);

            expect(mockedGaxiosRequest.mock.calls[0][0]).toMatchObject({
                method: 'GET',
                url: 'http://services.runescape.com/m=hiscore_oldschool/index_lite.ws',
                params: {
                    player: encodeURIComponent(playerName)
                }
            });
        });

        it('should default type to HiscoreTypes.normal', async () => {
            await getHiscores(playerName);

            expect(mockedGaxiosRequest.mock.calls[0][0]).toMatchObject({
                url: `http://services.runescape.com/m=${HiscoreTypes.normal}/index_lite.ws`
            });
        });

        it('should hit the specified hiscore type endpoint', async () => {
            const hiscoreType = HiscoreTypes.league;
            await getHiscores(playerName, hiscoreType);

            expect(mockedGaxiosRequest.mock.calls[0][0]).toMatchObject({
                url: `http://services.runescape.com/m=${hiscoreType}/index_lite.ws`
            });
        });

        it('should properly parse rank, level, and xp for each skill', async () => {
            const { skills } = await getHiscores(playerName);

            expect(skills).toEqual(mockSkillHiscores);
        });

        it('should properly parse rank and score for each minigame', async () => {
            const { minigames } = await getHiscores(playerName);

            expect(minigames).toEqual(mockMinigameHiscores);
        });

        it('should properly parse rank and kills for each boss', async () => {
            const { bosses } = await getHiscores(playerName);

            expect(bosses).toEqual(mockBossHiscores);
        });

        it('should return skills, minigames, and bosses from a csv', async () => {
            const output = await getHiscores(playerName);

            expect(output).toEqual({
                skills: mockSkillHiscores,
                minigames: mockMinigameHiscores,
                bosses: mockBossHiscores
            });
        });
    });
});
