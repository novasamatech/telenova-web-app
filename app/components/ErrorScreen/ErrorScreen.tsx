import { BodyText, MediumTitle, TitleText } from '@/components/Typography';

type Props = {
  error?: string;
};

export const ErrorScreen = ({ error = 'Unknown error' }: Props) => {
  return (
    <div className="h-screen p-4 w-full flex flex-col items-center justify-center gap-3">
      <img src="/images/error.svg" alt="error" width={100} height={100} />
      <TitleText className="mt-3">Unexpected Error</TitleText>
      <MediumTitle>Something went wrong, try again later</MediumTitle>
      {<BodyText>{error?.toString()}</BodyText>}
    </div>
  );
};
