import { BodyText, MediumTitle, TitleText } from '../Typography';

type Props = {
  error?: string;
};

export const ErrorScreen = ({ error = 'Unknown error' }: Props) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 p-4">
      <img src="/assets/misc/error.svg" alt="error" width={100} height={100} />
      <TitleText className="mt-3">Unexpected Error</TitleText>
      <MediumTitle>Something went wrong, try again later</MediumTitle>
      {<BodyText>{error?.toString()}</BodyText>}
    </div>
  );
};
