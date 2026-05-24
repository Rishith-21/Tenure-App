const Sound = {
  setSubscriptionDuration: jest.fn(),
  startRecorder: jest.fn(async () => 'file:///mock/recording.m4a'),
  stopRecorder: jest.fn(async () => 'file:///mock/recording.m4a'),
  startPlayer: jest.fn(async () => 'mock'),
  stopPlayer: jest.fn(async () => 'mock'),
  addRecordBackListener: jest.fn(),
  removeRecordBackListener: jest.fn(),
  addPlayBackListener: jest.fn(),
  removePlayBackListener: jest.fn(),
  addPlaybackEndListener: jest.fn(),
  removePlaybackEndListener: jest.fn(),
  mmss: jest.fn(() => '0:00'),
  mmssss: jest.fn(() => '0:00:00'),
};

export default Sound;
