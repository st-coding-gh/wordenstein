import { TSetStateType } from '@/types/data.types'

export class Data {
  // general
  isDataInitialized = false
  test = 'test value'
}

export class DataManager {
  private state: Data
  private setState: TSetStateType

  constructor(state: Data, setState: TSetStateType) {
    this.state = state
    this.setState = setState
  }

  async init() {
    if (!this.state.isDataInitialized) {
      this.state.isDataInitialized = true
    }

    this.update()
  }

  update() {
    this.setState(this.getState())
  }

  getState() {
    return { ...this.state }
  }
}
